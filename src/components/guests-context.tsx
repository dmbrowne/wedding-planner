import React, { Component } from "react";
import firebase, { firestore } from "firebase/app";
import { connect, DispatchProp } from "react-redux";
import { IRootReducer, subscribeToPath, unsubscribeFromPath } from "../store/reducers";
import {
  setCurrentQueryPage,
  setGuestsOrder,
  fetchGuestSuccess,
  unsubscribeGuestFetch,
  updateGuestSuccess,
  deleteGuestSuccess
} from "../store/guests-actions";
import { IGuest } from "../store/types";

type TReduxProps = {
  hasMore: boolean;
  weddingId: string;
  currentPageNumber: number;
  subscriptionPaths: {
    [path: string]: boolean;
  };
  documentsDerivedBySubscribe: {
    [path: string]: boolean;
  };
};

type TSubscriptionCallback = (snap: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => any;

interface IGuestContext {
  unsubscribeGuestListingWatch: undefined | (() => void);
  startWatch: () => void;
  loadMore: () => void;
  listenToDocumentRef: (guestId: string, cb?: TSubscriptionCallback) => null | (() => void);
  getDocumentRef: (guestId: string) => firebase.firestore.DocumentReference;
  setCouple: (guest1Id: string, guest2Id: string) => Promise<void>;
  unsetCouple: (guest1Id: string, guest2Id: string) => Promise<void>;
  removeFromGroup: (guestId: string, groupId: string) => Promise<void>;
  addToGroup: (guestId: string, groupId: string) => Promise<void>;
}

export const GuestsContext = React.createContext<IGuestContext>({
  unsubscribeGuestListingWatch: undefined,
  startWatch: () => {},
  loadMore: () => {},
  listenToDocumentRef: () => ({} as any),
  getDocumentRef: () => ({} as any),
  setCouple: () => Promise.resolve(),
  unsetCouple: () => Promise.resolve(),
  removeFromGroup: () => Promise.resolve(),
  addToGroup: () => Promise.resolve()
});

export const GuestsProvider = connect<TReduxProps, {}, {}, IRootReducer>(state => ({
  weddingId: state.activeWeddingId,
  currentPageNumber: state.guests.currentPageNumber,
  subscriptionPaths: state.subscriptions,
  documentsDerivedBySubscribe: state.guests.subscribed,
  hasMore: state.guests.hasMore
}))(
  class GuestsProviderComponent extends Component<TReduxProps & DispatchProp> {
    listingSubscribedGuestIds: string[] = [];
    unsubscribeGuestListingWatch: undefined | (() => void) = undefined;
    getDbRef = () => firebase.firestore().collection(`guests`);

    getDocumentRef = (guestId: string) => this.getDbRef().doc(guestId);

    guestCouple = (guestId1: string, guestId2: string, link: boolean) => {
      const batch = firebase.firestore().batch();
      batch.update(this.getDbRef().doc(guestId1), { partnerId: link ? guestId2 : null });
      batch.update(this.getDbRef().doc(guestId2), { partnerId: link ? guestId1 : null });
      return batch.commit();
    };

    removeFromGroup = (guestId: string, groupId: string) => {
      return this.getDocumentRef(guestId).update({ groupIds: firebase.firestore.FieldValue.arrayRemove(groupId) });
    };

    addToGroup = (guestId: string, groupId: string) => {
      return this.getDocumentRef(guestId).update({ groupIds: firebase.firestore.FieldValue.arrayUnion(groupId) });
    };

    listenToDocumentRef = (guestId: string, cb?: TSubscriptionCallback) => {
      const ref = this.getDocumentRef(guestId);

      if (this.props.documentsDerivedBySubscribe[guestId]) {
        return null;
      }

      this.props.dispatch(subscribeToPath(ref.path));

      const unsubscribe = ref.onSnapshot(snap => {
        this.props.dispatch(fetchGuestSuccess({ id: snap.id, ...(snap.data() as IGuest) }, true));
        if (cb) cb(snap);
      });

      return () => {
        this.props.dispatch(unsubscribeFromPath(ref.path));
        this.props.dispatch(unsubscribeGuestFetch(guestId));
        unsubscribe();
      };
    };

    onGuestsSnapshot = (snap: firestore.QuerySnapshot<firestore.DocumentData>, pageNumber: number) => {
      const { dispatch } = this.props;

      snap.docChanges().forEach(({ doc, type }) => {
        if (type === "added") {
          dispatch(fetchGuestSuccess({ id: doc.id, ...(doc.data() as IGuest) }, true));
          if (!this.listingSubscribedGuestIds.includes(doc.id)) {
            this.listingSubscribedGuestIds.push(doc.id);
          }
        }
        if (type === "modified") dispatch(updateGuestSuccess({ id: doc.id, ...(doc.data() as IGuest) }));
        if (type === "removed") dispatch(deleteGuestSuccess(doc.id));
      });
      const order = snap.docs.map(doc => doc.id);
      const hasMore = snap.docs.length === 21 * pageNumber;
      dispatch(setCurrentQueryPage(pageNumber));
      dispatch(setGuestsOrder(hasMore ? order.slice(0, order.length - 1) : order, hasMore));
    };

    loadMore = (pageNumber: number) => {
      const { weddingId } = this.props;
      const ref = this.getDbRef();

      if (this.unsubscribeGuestListingWatch) {
        this.unsubscribeGuestListingWatch();
      }

      this.props.dispatch(subscribeToPath(ref.path));

      const unsubscribe = ref
        .where("weddingId", "==", weddingId)
        .orderBy("name", "asc")
        .limit(21 * pageNumber)
        .onSnapshot(snap => this.onGuestsSnapshot(snap, pageNumber));

      this.unsubscribeGuestListingWatch = () => {
        unsubscribe();
        this.props.dispatch(unsubscribeFromPath(ref.path));
        this.listingSubscribedGuestIds.forEach(id => {
          this.props.dispatch(unsubscribeGuestFetch(id));
        });
      };
    };

    componentWillUnmount() {
      if (this.unsubscribeGuestListingWatch) {
        this.unsubscribeGuestListingWatch();
      }
    }

    render() {
      return (
        <GuestsContext.Provider
          value={{
            unsubscribeGuestListingWatch: this.unsubscribeGuestListingWatch,
            startWatch: () => (this.unsubscribeGuestListingWatch ? null : this.loadMore(1)),
            loadMore: () => (this.props.hasMore ? this.loadMore(this.props.currentPageNumber + 1) : null),
            listenToDocumentRef: this.listenToDocumentRef,
            getDocumentRef: this.getDocumentRef,
            setCouple: (id1, id2) => this.guestCouple(id1, id2, true),
            unsetCouple: (id1, id2) => this.guestCouple(id1, id2, false),
            removeFromGroup: this.removeFromGroup,
            addToGroup: this.addToGroup
          }}
        >
          {this.props.children}
        </GuestsContext.Provider>
      );
    }
  }
);
