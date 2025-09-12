import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FileInfo } from '../models/file-info.model';
import { IfsService } from '../services/ifs.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ifs-browser',
  imports: [CommonModule],
  templateUrl: './ifs-browser.component.html',
  styleUrl: './ifs-browser.component.css'
})
export class IfsBrowserComponent implements OnInit {

@ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  files: FileInfo[] = [];
  currentPath: string = '/home/BulkAccUplSA'; // Set your default path here
  pathHistory: string[] = [];
  loading: boolean = false;
  error: string = '';
  fileData: any[] = [];
  showFileViewer: boolean = false;
  fileColumns: string[] = [];

  constructor(private ifsService: IfsService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadFiles(this.currentPath);
  }

  loadFiles(path: string): void {
    this.loading = true;
    this.error = '';
    this.showFileViewer = false;
    
    this.ifsService.listFiles(path).subscribe({
      next: (files) => {
        this.files = files.sort((a, b) => {
          // Directories first, then files
          if (a.directory && !b.directory) return -1;
          if (!a.directory && b.directory) return 1;
          return a.name.localeCompare(b.name);
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load files: ' + error.message;
        this.loading = false;
      }
    });
  }

  navigateToFolder(file: FileInfo): void {
    if (file.directory) {
      this.pathHistory.push(this.currentPath);
      this.currentPath = file.path;
      this.loadFiles(this.currentPath);
    }
  }

  navigateBack(): void {
    if (this.pathHistory.length > 0) {
      this.currentPath = this.pathHistory.pop() || this.currentPath;
      this.loadFiles(this.currentPath);
    }
  }

  downloadFile(file: FileInfo): void {
    if (!file.directory) {
      this.ifsService.downloadFile(file.path).subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          this.error = 'Failed to download file: ' + error.message;
        }
      });
    }
  }

  viewFile(file: FileInfo): void {
    if (file.type === 'csv' || file.type === 'excel') {
      this.loading = true;
      this.ifsService.readFile(file.path).subscribe({
        next: (data) => {
          this.fileData = data;
          this.fileColumns = data.length > 0 ? Object.keys(data[0]) : [];
          this.showFileViewer = true;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to read file: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  closeFileViewer(): void {
    this.showFileViewer = false;
    this.fileData = [];
    this.fileColumns = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(file: FileInfo): string {
    if (file.directory) return '📁';
    if (file.type === 'excel') return '📊';
    return '📄';
  }

  onUploadFile(): void {
  // Create a hidden file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv,.xls,.xlsx'; // Only accept supported file types
  fileInput.style.display = 'none';
  
  fileInput.onchange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  };
  
  // Trigger file selection dialog
  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
}

// Upload file with validation
private uploadFile(file: File): void {
  const fileName = file.name;
  
  // Validate filename length
  if (fileName.length > 44) {
    alert(`File name is too long (${fileName.length} characters). Maximum allowed is 44 characters.`);
    return;
  }
  
  // Validate file type
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    alert('Unsupported file type. Please upload CSV, XLS, or XLSX files only.');
    return;
  }
  
  // Show loading indicator (optional)
  //this.loading = true;
  
  // Prepare form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', this.currentPath); // Upload to current directory
  
  // Call your upload service
  this.ifsService.uploadFile(formData).subscribe({
    next: (response) => {
       this.snackBar.open(
      `File "${fileName}" uploaded successfully!`,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
      
      // Refresh the file list to show the new file
      this.loadFiles(this.currentPath);
      this.loading = false;
    },
    error: (error) => {
      console.error('Upload failed:', error);
      let errorMessage = 'Failed to upload file.';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Upload failed: ${errorMessage}`);
      this.loading = false;
    }
  });
}
}
