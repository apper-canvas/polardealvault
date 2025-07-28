import mockPlatforms from "@/services/mockData/platforms.json";

let platforms = [...mockPlatforms];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll = async () => {
  await delay(300);
  return [...platforms];
};

export const getById = async (id) => {
  await delay(200);
  const platform = platforms.find(p => p.Id === parseInt(id));
  if (!platform) {
    throw new Error("Platform not found");
  }
  return { ...platform };
};

export const create = async (platformData) => {
  await delay(400);
  const maxId = Math.max(...platforms.map(p => p.Id), 0);
  const newPlatform = {
    ...platformData,
    Id: maxId + 1
  };
  platforms.unshift(newPlatform);
  return { ...newPlatform };
};

export const update = async (id, platformData) => {
  await delay(400);
  const index = platforms.findIndex(p => p.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Platform not found");
  }
  const updatedPlatform = {
    ...platforms[index],
    ...platformData,
    Id: parseInt(id)
  };
  platforms[index] = updatedPlatform;
  return { ...updatedPlatform };
};

export const delete_ = async (id) => {
  await delay(300);
  const index = platforms.findIndex(p => p.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Platform not found");
  }
  platforms.splice(index, 1);
  return true;
};

export { delete_ as delete };