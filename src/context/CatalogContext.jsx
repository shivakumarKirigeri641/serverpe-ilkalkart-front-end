import { createContext, useContext, useMemo } from 'react';
import { useProducts, useQueryTypes, useOffers } from '../api/queries.js';
import { facetsOf, buildPriceBuckets, heroMediaOf } from '../data/sarees.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const products = useProducts();
  const queryTypes = useQueryTypes();
  const offers = useOffers();

  const value = useMemo(() => {
    const sarees = products.data || [];
    const qt = queryTypes.data || [];
    const offerList = offers.data || [];
    const bestOffer = offerList.reduce(
      (best, o) => (o.percent > (best?.percent || 0) ? o : best),
      null
    );
    const facets = facetsOf(sarees);
    return {
      sarees,
      queryTypes: qt,
      offers: offerList,
      bestOffer,
      loading: products.isLoading || queryTypes.isLoading || offers.isLoading,
      error: products.error || queryTypes.error || offers.error || null,
      refetch: () => {
        products.refetch();
        queryTypes.refetch();
        offers.refetch();
      },
      ...facets,
      PRICE_BUCKETS: buildPriceBuckets(sarees),
      heroMedia: heroMediaOf(sarees),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.data, products.isLoading, products.error, queryTypes.data, queryTypes.isLoading, queryTypes.error, offers.data, offers.isLoading, offers.error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
