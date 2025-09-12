export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  directory: boolean;
  type: string;
}

export interface ExcelData {
  [key: string]: string | number | boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}