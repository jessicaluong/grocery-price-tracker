import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import Header from "@/app/(dashboard)/groceries/components/header/header";
import GroceryList from "@/app/(dashboard)/groceries/components/grocery-list/grocery-list";
import { SortParamValues, ViewParamValues } from "@/lib/types";
import { Suspense } from "react";
import GroceryListLoading from "./components/grocery-list/grocery-list-loading";

type PageProps = {
  searchParams: {
    query?: string;
    sort?: string;
    view?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const viewMode = (searchParams.view || DEFAULT_VIEW.param) as ViewParamValues;
  const sortBy = (searchParams.sort || DEFAULT_SORT.param) as SortParamValues;
  const searchQuery = searchParams.query || "";

  return (
    <main className="flex justify-center w-full p-[10px]">
      <div className="flex w-full max-w-[1200px] sm:border rounded-xl">
        <div className="flex-1 min-w-0  p-[10px]">
          <Header />
          <Suspense fallback={<GroceryListLoading />}>
            <GroceryList
              searchQuery={searchQuery}
              sortBy={sortBy}
              viewMode={viewMode}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
