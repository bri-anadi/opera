import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0052ff',
          backgroundImage: 'linear-gradient(45deg, #0052ff 0%, #0066ff 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#0052ff',
            }}
          >
            🎵
          </div>
        </div>
        <div
          style={{
            fontSize: '60px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Opera Payroll
        </div>
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Open Payroll Raising Automatically
        </div>
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          Decentralized payroll management on Base
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}