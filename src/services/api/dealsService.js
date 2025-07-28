import mockDeals from "@/services/mockData/deals.json";

let deals = [...mockDeals];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll = async () => {
  await delay(300);
  return [...deals];
};

export const getById = async (id) => {
  await delay(200);
  const deal = deals.find(d => d.Id === parseInt(id));
  if (!deal) {
    throw new Error("Deal not found");
  }
  return { ...deal };
};

export const create = async (dealData) => {
  await delay(400);
  const maxId = Math.max(...deals.map(d => d.Id), 0);
  const newDeal = {
    ...dealData,
    Id: maxId + 1,
    dateAdded: new Date().toISOString()
  };
  deals.unshift(newDeal);
  return { ...newDeal };
};

export const update = async (id, dealData) => {
  await delay(400);
  const index = deals.findIndex(d => d.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Deal not found");
  }
  const updatedDeal = {
    ...deals[index],
    ...dealData,
    Id: parseInt(id)
  };
  deals[index] = updatedDeal;
  return { ...updatedDeal };
};

export const delete_ = async (id) => {
  await delay(300);
  const index = deals.findIndex(d => d.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Deal not found");
  }
  deals.splice(index, 1);
  return true;
};

export { delete_ as delete };