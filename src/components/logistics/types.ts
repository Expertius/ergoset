export type DeliveryTaskItem = {
  id: string;
  type: string;
  status: string;
  plannedAt: Date | null;
  assignee: string | null;
  address: string | null;
  instructions: string | null;
  comment: string | null;

  pointFrom: string | null;
  pointTo: string | null;
  pointFromLat: number | null;
  pointFromLng: number | null;
  pointToLat: number | null;
  pointToLng: number | null;
  distanceKm: number | null;
  driveDurationMin: number | null;

  timeLoading: number | null;
  timeDriving: number | null;
  timeCarrying: number | null;
  timeAssembly: number | null;
  timeDisassembly: number | null;
  timeUnloading: number | null;
  totalTimeMin: number | null;

  startedAt: Date | null;
  completedAt: Date | null;

  fuelCost: number | null;
  tollCost: number | null;
  otherCost: number | null;
  totalCost: number | null;

  salaryBase: number | null;
  salaryPerKm: number | null;
  salaryTotal: number | null;

  logistComment: string | null;
  clientNote: string | null;
  floor: number | null;
  hasElevator: boolean | null;

  createdAt: Date;
  updatedAt: Date;

  rental: {
    id: string;
    addressDelivery?: string | null;
    addressPickup?: string | null;
    asset: { code: string; name: string };
    deal: {
      id: string;
      client: { id: string; fullName: string; deliveryNotes: string | null };
    };
  };
  comments: {
    id: string;
    text: string;
    createdAt: Date;
    author: { id: string; fullName: string | null } | null;
  }[];
  expenses: {
    id: string;
    amount: number;
    category: string;
  }[];
};
