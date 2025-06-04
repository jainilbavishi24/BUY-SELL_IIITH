import { create } from "zustand";

export const useItemStore = create((set) => ({
  item: [],
  setItems: (item) => set({ item }),
  createItem: async (newItem) => {
    if (
      !newItem.name ||
      !newItem.price ||
      !newItem.description ||
      !newItem.category ||
      !newItem.sellerID ||
      !newItem.image
    ) {
      return { success: false, message: "All fields are required" };
    }
    const res = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    if (data.success) {
      set((state) => ({ item: [...state.item, data.data] }));
      return { success: true, message: "Product created successfully" };
    } else {
      return { success: false, message: data.message || "Failed to create product" };
    }
  },
}));