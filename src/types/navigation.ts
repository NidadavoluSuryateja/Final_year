/**
 * Navigation Type Definitions
 * Root stack and screen parameter types
 */

export type RootStackParamList = {
  DestinationSelection: undefined;
  Navigation: {
    buildingId: string;
    buildingName: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
};

/**
 * Generic screen props type for navigation
 */
export interface ScreenProps<T extends keyof RootStackParamList> {
  route: {
    key: string;
    name: T;
    params: RootStackParamList[T];
  };
  navigation: {
    navigate: <K extends keyof RootStackParamList>(
      name: K,
      params?: RootStackParamList[K]
    ) => void;
    goBack: () => void;
    dispatch: (action: any) => void;
  };
}
