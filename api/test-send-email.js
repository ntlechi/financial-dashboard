// Simple test API route to verify Vercel function deployment
export default async function handler(req, res) {
  console.log('🧪 Test API route called');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, trigger, additionalData = {} } = req.body;
    
    console.log('📧 Test email trigger:', { userId, trigger, additionalData });
    
    // Simple response without Firebase/ConvertKit for now
    return res.status(200).json({ 
      success: true, 
      message: 'Test email API working',
      data: { userId, trigger, additionalData }
    });
    
  } catch (error) {
    console.error('❌ Test API error:', error);
    return res.status(500).json({ 
      error: 'Test API failed',
      details: error.message 
    });
  }
}
