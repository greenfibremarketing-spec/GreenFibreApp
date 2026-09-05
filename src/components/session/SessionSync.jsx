import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    syncSessionAfterAuth,
    clearSessionCartWishlist,
    loadGuestCartForDisplay,
} from '../../store/thunks/sessionSyncThunks';

export function SessionSync() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, hydrated } = useAppSelector((state) => state.auth);
    const wasAuthenticated = useRef(false);

    useEffect(() => {
        if (!hydrated) {
            return;
        }

        if (isAuthenticated) {
            dispatch(syncSessionAfterAuth());
        }
        else if (wasAuthenticated.current) {
            dispatch(clearSessionCartWishlist());
        }
        else {
            dispatch(loadGuestCartForDisplay());
        }

        wasAuthenticated.current = isAuthenticated;
    }, [dispatch, hydrated, isAuthenticated]);

    return null;
}
