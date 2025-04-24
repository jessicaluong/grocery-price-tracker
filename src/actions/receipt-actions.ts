"use server";

import { verifySession } from "@/lib/auth";
import { processSaleItemName } from "@/lib/receipt-utils";
import { checkAndUpdateScanUsage } from "@/lib/scan-rate-limit";
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

  const scanUsageResult = await checkAndUpdateScanUsage(session.userId);
  if (!scanUsageResult.success) {
    return { error: scanUsageResult.message };
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
  const dateString = fields.TransactionDate?.valueString ?? null;
  const date = dateString ? new Date(dateString) : null;
  const items = [];

  for (const { valueObject: receiptItem } of (receiptItems &&
    receiptItems.valueArray) ||
    []) {
    if (!receiptItem) continue;
    const name = receiptItem.Description?.valueString ?? null;
    const price = receiptItem.TotalPrice?.valueCurrency?.amount ?? null;
    const amount = receiptItem.Quantity?.valueNumber ?? null;
    const unit = receiptItem.QuantityUnit?.valueString ?? null;

    const { normalizedName, isSale } = processSaleItemName(name);

    items.push({
      name: normalizedName,
      price,
      amount,
      unit,
      isSale,
      brand: null,
      count: null,
    });
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
