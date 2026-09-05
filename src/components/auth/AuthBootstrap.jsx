import { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { restoreAuthSession } from '../../store/thunks/authThunks';

export function AuthBootstrap({ children }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(restoreAuthSession());
    }, [dispatch]);

    return children;
}
