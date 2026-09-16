/**
 * Backup and Restore utilities for PYTHON-MASTER
 * Allows exporting full learning progress, bookmarks, notes, and exercise code to JSON,
 * with strict schema versioning and dataset versioning for long-term migration safety.
 */

export interface BackupData {
  schemaVersion: number;
  app: 'PYTHON-MASTER';
  exportedAt: string;
  datasetVersion: string;
  data: Record<string, string>;
}

export const CURRENT_SCHEMA_VERSION = 1;
export const CURRENT_DATASET_VERSION = '2026.1';

export function exportAllData(): string {
  if (typeof window === 'undefined') return '';

  const backup: BackupData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    app: 'PYTHON-MASTER',
    exportedAt: new Date().toISOString(),
    datasetVersion: CURRENT_DATASET_VERSION,
    data: {},
  };

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('python-master:')) {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          backup.data[key] = val;
        }
      }
    }
  } catch (e) {
    console.error('Failed to export data from localStorage:', e);
  }

  return JSON.stringify(backup, null, 2);
}

export function downloadBackupFile(): void {
  const jsonStr = exportAllData();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `python-master-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupData(jsonString: string): { success: boolean; count: number; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, count: 0, error: 'Chỉ hoạt động trên trình duyệt' };
  }

  try {
    const parsed = JSON.parse(jsonString) as Partial<BackupData> & { version?: string; timestamp?: string };

    if (!parsed || parsed.app !== 'PYTHON-MASTER' || !parsed.data) {
      return { success: false, count: 0, error: 'Tệp sao lưu không hợp lệ hoặc không thuộc về PYTHON-MASTER.' };
    }

    // Support both schemaVersion number and legacy version string
    const schemaVer = parsed.schemaVersion ?? (parsed.version ? 1 : 1);

    if (schemaVer > CURRENT_SCHEMA_VERSION) {
      return {
        success: false,
        count: 0,
        error: `Tệp sao lưu thuộc phiên bản mới hơn (${schemaVer}) so với nền tảng hiện tại (${CURRENT_SCHEMA_VERSION}). Vui lòng cập nhật website trước.`,
      };
    }

    let count = 0;
    for (const [key, val] of Object.entries(parsed.data)) {
      if (key.startsWith('python-master:')) {
        window.localStorage.setItem(key, val);
        count++;
      }
    }

    // Trigger storage event so all listening hooks update reactively
    window.dispatchEvent(new Event('storage'));

    return { success: true, count };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, count: 0, error: `Lỗi đọc tệp JSON: ${message}` };
  }
}
