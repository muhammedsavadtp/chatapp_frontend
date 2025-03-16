import { useSelector as reduxUseSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";

type ActionPayload<T> = { type: string; payload: T };

// Custom hook
export function useSelector<TState = RootState, TSelected = unknown>(
  selector: (state: TState) => TSelected
) {
  const selectedState = reduxUseSelector(selector);

  const dispatch = useDispatch<AppDispatch>();

  const setState = <T>(action: ActionPayload<T>) => {
    dispatch(action);
  };

  return [selectedState, setState] as const;
}
