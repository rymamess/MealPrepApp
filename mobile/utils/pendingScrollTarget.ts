// Permet à un écran (création/édition de recette) de signaler à l'écran précédent,
// vers lequel on revient via router.back(), quel élément scroller en vue une fois
// la liste rafraîchie — un back() ne transporte pas de nouveaux params.
let pendingId: string | null = null;

export const setPendingScrollTarget = (id: string) => {
  pendingId = id;
};

export const consumePendingScrollTarget = (): string | null => {
  const id = pendingId;
  pendingId = null;
  return id;
};
