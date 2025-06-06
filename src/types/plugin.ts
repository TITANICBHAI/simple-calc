export interface Plugin {
  id: string;
  name: string;
  status: 'enabled' | 'disabled' | 'error';
  source: string; // file path or URL
}