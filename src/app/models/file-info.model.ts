export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  directory: boolean;
  type: string;
  recentlyUploaded?: boolean;
}

