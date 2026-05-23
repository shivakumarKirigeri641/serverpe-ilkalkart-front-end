import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../utils/api.js";
import { mapProductToSaree } from "../data/sarees.js";

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: () => apiGet("/products"),
    select: (res) =>
      Array.isArray(res?.data) ? res.data.map(mapProductToSaree) : [],
  });

export const useQueryTypes = () =>
  useQuery({
    queryKey: ["query-types"],
    queryFn: () => apiGet("/query-types"),
    select: (res) => (Array.isArray(res?.data) ? res.data : []),
  });

export const useOffers = () =>
  useQuery({
    queryKey: ["offers"],
    queryFn: () => apiGet("/offers"),
    select: (res) =>
      Array.isArray(res?.data)
        ? res.data.map((o) => ({
            title: o.title,
            description: o.description,
            percent: Number(o.offer_percent_value) || 0,
          }))
        : [],
    staleTime: 5 * 60 * 1000,
  });

export const useSareeMedia = (sareeCode, colorCode, enabled = true) =>
  useQuery({
    queryKey: ["saree-photos", sareeCode, colorCode],
    queryFn: () => apiGet(`/saree-photos/${sareeCode}/${colorCode}`),
    select: (res) => res?.data || { images: {}, videos: [] },
    enabled: enabled && Boolean(sareeCode) && Boolean(colorCode),
  });

export const useDirContents = (dir) =>
  useQuery({
    queryKey: ["dir-contents", dir],
    queryFn: () => apiGet(`/dir-contents`, { params: { dir } }),
    select: (res) => res?.data || { images: [], videos: [] },
    enabled: Boolean(dir),
    staleTime: 5 * 60 * 1000,
  });
