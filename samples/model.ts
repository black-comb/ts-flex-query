export interface MasterNode {
  Id: number;
  InfrastructureVariantId: number;
}

export interface Facility {
  Id: number;
  BusinessId: number;
  Name: string;
  Node?: Node;
}

export interface Provider {
  Id: number;
  BusinessId: number;
}

export interface Node {
  Id: number;
  Name?: string;
  MasterNode: MasterNode;
  AlternativeMasterNode: MasterNode;
  Facilities: Facility[];
  AlternativeFacilities: Facility[];
  Providers: Provider[];
}
