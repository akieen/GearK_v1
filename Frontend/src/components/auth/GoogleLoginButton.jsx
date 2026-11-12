import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// Authentic Google Multi-Color SVG Logo
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 8, display: 'inline-block' }}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export default function GoogleLoginButton({ onGoogleSuccess, disabled = false }) {
  const googleBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [customEmail, setCustomEmail] = useState('demo.google@gmail.com');
  const [customName, setCustomName] = useState('Google User Test');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Tự động tải Google Identity Services SDK nếu chưa có
    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleGsi();
      document.body.appendChild(script);
    } else {
      initGoogleGsi();
    }
  }, [clientId]);

  const initGoogleGsi = () => {
    if (!window.google?.accounts?.id || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response?.credential) {
            setLoading(true);
            try {
              await onGoogleSuccess(response.credential);
            } finally {
              setLoading(false);
            }
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    } catch (err) {
      console.warn('[Google GSI] Init failed:', err);
    }
  };

  const handleCustomClick = () => {
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn('Google prompt fallback:', e);
      }
    } else {
      // Khi chưa có Client ID trong .env, mở hộp thoại hỗ trợ test / hướng dẫn config
      setShowConfigDialog(true);
    }
  };

  const handleConfirmDemoLogin = async () => {
    if (!customEmail) return;
    setLoading(true);
    setShowConfigDialog(false);
    try {
      // Tạo token demo hợp lệ định dạng JWT để Backend decode
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify({
              iss: 'https://accounts.google.com',
              sub: 'google_test_' + Date.now(),
              email: customEmail.trim(),
              email_verified: true,
              name: customName.trim() || 'Người dùng Google',
              picture: 'https://lh3.googleusercontent.com/a/default-user',
            })
          )
        )
      );
      const signature = btoa('demo_signature');
      const fakeGoogleToken = `${header}.${payload}.${signature}`;

      await onGoogleSuccess(fakeGoogleToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      {/* Container nếu dùng Google Button chính thức */}
      {clientId ? (
        <Box
          ref={googleBtnRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            minHeight: 44,
            '& > div': { width: '100% !important' },
          }}
        />
      ) : (
        /* Nút đăng nhập Google với giao diện chuẩn */
        <Button
          fullWidth
          variant="outlined"
          size="large"
          disabled={disabled || loading}
          onClick={handleCustomClick}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <GoogleIcon />}
          sx={{
            height: 44,
            borderColor: '#CBD5E1',
            bgcolor: '#FFFFFF',
            color: '#1E293B',
            textTransform: 'none',
            fontSize: '14.5px',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': {
              bgcolor: '#F8FAFC',
              borderColor: '#94A3B8',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            },
          }}
        >
          {loading ? 'Đang xác thực Google...' : 'Đăng nhập với Google'}
        </Button>
      )}

      {/* Dialog hướng dẫn & Demo khi chưa cấu hình Google Client ID */}
      <Dialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center' }}>
          <GoogleIcon /> Đăng nhập qua Google OAuth
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Alert severity="info" sx={{ mb: 2, fontSize: '12.5px' }}>
            Để sử dụng Google OAuth thực tế trên production, bạn chỉ cần thêm:
            <br />
            <code>VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com</code>
            <br />
            vào file <code>Frontend/.env</code>.
          </Alert>

          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
            Trong môi trường phát triển hiện tại, bạn có thể thử nghiệm ngay luồng đăng nhập Google bên dưới:
          </Typography>

          <TextField
            fullWidth
            label="Email Google thử nghiệm"
            size="small"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            sx={{ mb: 1.5 }}
          />

          <TextField
            fullWidth
            label="Họ tên hiển thị"
            size="small"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowConfigDialog(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDemoLogin}
            disabled={!customEmail}
            sx={{
              textTransform: 'none',
              bgcolor: '#4285F4',
              '&:hover': { bgcolor: '#3367D6' },
              fontWeight: 600,
            }}
          >
            Đăng nhập thử ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

