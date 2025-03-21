import { db } from "@/lib/server/db/db";
import { tarkovItems } from "@/lib/server/db/schema";
import { schedules } from "@trigger.dev/sdk/v3";

export const fetchItemsTask = schedules.task({
  id: "fetch-items",
  run: async () => {
    const response = await fetch("https://api.tarkov.dev/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
            query Items {
              items {
                id
                name
                shortName
                normalizedName
                basePrice
                sellFor {
                  vendor {
                    name
                  }
                  price
                  priceRUB
                  currency
                }
              }
            }
          `,
      }),
    });

    const responseJson = await response.json();

    const itemData = responseJson.data.items as any[];

    const mappedItems: (typeof tarkovItems.$inferInsert)[] = itemData.map(
      (item) => {
        const bestSell = item.sellFor.sort(
          (a: any, b: any) => a.priceRUB - b.priceRUB
        )[0];

        return {
          id: item.id,
          name: item.name,
          shortName: item.shortName,
          normalizedName: item.normalizedName,
          basePrice: item.basePrice,
          bestSell: bestSell
            ? bestSell
            : {
                currency: "RUB",
                price: item.basePrice,
                priceRUB: item.basePrice,
                vendor: null,
              },
        };
      }
    );

    await db.transaction(async (tx) => {
      await tx.delete(tarkovItems);
      for (let i = 0; i < mappedItems.length; i += 1000) {
        const batch = mappedItems.slice(i, i + 1000);
        await tx.insert(tarkovItems).values(batch);
      }
    });
  },
});
