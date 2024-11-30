export interface ClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  total_mag: number;
}
export interface SingleProperties {
  cluster?: false | undefined;
  mag: number;
  time: number;
  tsunami?: boolean;
}
export type ClusterFeatureProperties = SingleProperties | ClusterProperties;
