import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet } from '../utils/api.js';
import {
  mapProductToSaree,
  facetsOf,
  buildPriceBuckets,
  heroMediaOf,
} from '../data/sarees.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [sarees, setSarees] = useState([]);
  const [queryTypes, setQueryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [products, qt] = await Promise.all([
          apiGet('/products'),
          apiGet('/query-types'),
        ]);
        if (!alive) return;
        const list = Array.isArray(products?.data) ? products.data : [];
        setSarees(list.map(mapProductToSaree));
        setQueryTypes(Array.isArray(qt?.data) ? qt.data : []);
      } catch (e) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => {
    const facets = facetsOf(sarees);
    return {
      sarees,
      queryTypes,
      loading,
      error,
      ...facets,
      PRICE_BUCKETS: buildPriceBuckets(sarees),
      heroMedia: heroMediaOf(sarees),
    };
  }, [sarees, queryTypes, loading, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
