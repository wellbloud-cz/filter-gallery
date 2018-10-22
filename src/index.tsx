import * as Portal from "esri/portal/Portal";

import {
    applyMiddleware,
    createStore,
    createProjector,
    createEpicMiddleware,
    H,
    Store,
    addListener
} from "./Component";
import { rootEpic } from "./_epic";
import reducer, { initialState, FilterGalleryState } from "./_reducer";
import RootComponent from "./components/FilterGallery";
import { loadPortal } from "./_actions";
import { startHistoryListener, router } from "./router";

export type FilterGalleryStore = Store<FilterGalleryState>;

export default (config: { [propName: string]: any }) => {
    // Inject custom stylesheet if provided
    if (initialState.settings.config.customCSS) {
        const customStyle = document.createElement("style");
        customStyle.innerHTML = initialState.settings.config.customCSS;
        document.body.appendChild(customStyle);
    }

    const node = document.getElementById("viewDiv") as HTMLElement;
    const portal = new Portal({ url: config.baseUrl ? config.baseUrl : initialState.settings.config.url });
    const store: FilterGalleryStore = applyMiddleware(
        createEpicMiddleware(rootEpic),
        router,
        // addListener((action, state) => console.log(action, state))
    )(createStore)(reducer, {
        ...initialState,
        settings: {
            ...initialState.settings,
            config: {
                ...initialState.settings.config,
                ...config
            },
            utils: {
                ...initialState.settings.utils,
                portal
            }
        }
    });
    store.dispatch(loadPortal());
    startHistoryListener(store);
    createProjector(
        store,
        (tsx: H) => (<RootComponent key="root" />),
        node
    );
};
