"use server";

import { verifySession } from "@/lib/auth";
import { capitalizeWords } from "@/lib/utils";
import DocumentIntelligence from "@azure-rest/ai-document-intelligence";
import {
  getLongRunningPoller,
  isUnexpected,
  AnalyzeResultOutput,
} from "@azure-rest/ai-document-intelligence";
import { AzureKeyCredential } from "@azure/core-auth";

export async function scanReceiptAction(formData: FormData) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { error: "You must be logged in to scan receipts" };
  }

  const file = formData.get("file") as File;

  if (!file.type.startsWith("image/")) {
    return { error: "Uploaded file must be an image" };
  }

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    return { error: "Azure credentials not found" };
  }

  const client = DocumentIntelligence(endpoint, new AzureKeyCredential(key));

  const arrayBuffer = await file.arrayBuffer();
  const base64Source = Buffer.from(arrayBuffer).toString("base64");

  const initialResponse = await client
    .path("/documentModels/{modelId}:analyze", "prebuilt-receipt")
    .post({
      contentType: "application/json",
      body: {
        base64Source,
      },
    });

  if (isUnexpected(initialResponse)) {
    throw initialResponse.body.error;
  }

  const poller = getLongRunningPoller(client, initialResponse);
  const response = await poller.pollUntilDone();
  const responseBody = response.body as {
    analyzeResult: AnalyzeResultOutput;
  };
  const analyzeResult = responseBody.analyzeResult;

  const documents = analyzeResult?.documents;
  const result = documents && documents[0];

  if (!result) {
    return { error: "No results" };
  }

  const fields = result.fields ?? {};
  const store = fields.MerchantName.valueString ?? null;
  const receiptItems = fields.Items;
  const date = fields.TransactionDate.valueString ?? null;
  const items = [];

  for (const { valueObject: receiptItem } of (receiptItems &&
    receiptItems.valueArray) ||
    []) {
    if (!receiptItem) continue;
    const name = receiptItem.Description?.valueString ?? null;
    const price = receiptItem.TotalPrice?.valueCurrency?.amount ?? null;
    const amount = receiptItem.Quantity?.valueNumber ?? null;
    const unit = receiptItem.QuantityUnit?.valueString ?? null;

    let isSale = false;
    let saleText = null;
    let normalizedName;

    if (name) {
      const salePattern = /(\(sale\)|\[sale\]|\bsale\b)/i;
      const saleMatch = name.match(salePattern);

      if (saleMatch) {
        isSale = true;
        saleText = saleMatch[0];

        let cleanedName = name.replace(saleMatch[0], "").trim();
        cleanedName = cleanedName.replace(/\s+/g, " ").trim();

        normalizedName = capitalizeWords(cleanedName);
      } else {
        normalizedName = capitalizeWords(name);
      }
    }

    items.push({ name: normalizedName, price, amount, unit, isSale });
  }

  return {
    success: true,
    data: {
      store,
      date,
      items,
    },
  };
}
