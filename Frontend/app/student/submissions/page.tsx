'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn } from '@/components/ui';
import api from '@/lib/api';

interface Submission {
  id: number; assignment_id: number; assignment_title: string | null;
  submission_text: string; grade: number | null; feedback: string | null;
  submitted_at: string; file_name?: string; file_type?: string; has_file?: boolean;
}

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => { api.get('/student/submissions').then(r => setSubmissions(r.data.submissions)); }, []);

  const downloadFile = (id: number, fileName: string) => {
    const token = localStorage.getItem('token');
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/student/submissions/${id}/download`;
    link.setAttribute('download', fileName);
    // Use fetch with auth header
    fetch(`http://localhost:5000/api/student/submissions/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <ProtectedRoute role="student">
      <PageHeader title="My Submissions" subtitle={`${submissions.length} total`} />
      <Table headers={['Assignment', 'Submitted', 'File', 'Grade', 'Feedback']}>
        {submissions.map(s => (
          <tr key={s.id}>
            <Td><span style={{ color: '#0f172a', fontWeight: 500 }}>{s.assignment_title || `#${s.assignment_id}`}</span></Td>
            <Td>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '-'}</Td>
            <Td>
              {s.has_file && s.file_name
                ? <Btn variant="ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => downloadFile(s.id, s.file_name!)}>
                    📎 {s.file_name}
                  </Btn>
                : <span style={{ color: '#94a3b8', fontSize: 12 }}>Text only</span>}
            </Td>
            <Td>
              {s.grade != null
                ? <Badge label={`${s.grade} pts`} color="#10b981" />
                : <span style={{ color: '#94a3b8', fontSize: 12 }}>Pending</span>}
            </Td>
            <Td style={{ maxWidth: 200 }}>
              {s.feedback
                ? <span style={{ fontSize: 12, color: '#334155' }}>{s.feedback}</span>
                : <span style={{ color: '#94a3b8', fontSize: 12 }}>-</span>}
            </Td>
          </tr>
        ))}
        {submissions.length === 0 && (
          <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 32, fontSize: 13 }}>No submissions yet.</td></tr>
        )}
      </Table>
    </ProtectedRoute>
  );
}
