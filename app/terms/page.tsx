export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 pt-24 md:pt-32">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: December 1, 2025</p>
        
        <div className="prose prose-lg max-w-none">
          <p>Welcome to CampusTrade. These Terms of Service ("Terms") govern your access to and use of the CampusTrade website and services ("Service"). Please read these Terms carefully.</p>

          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>By creating an account and using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service.</p>

          <h2 className="text-2xl font-semibold">2. User Eligibility</h2>
          <p>The Service is available exclusively to currently enrolled students with a valid university email address. By using the Service, you represent and warrant that you meet this eligibility requirement.</p>

          <h2 className="text-2xl font-semibold">3. User Conduct</h2>
          <p>You agree not to use the Service to post or exchange any prohibited items, including but not limited to illegal goods, alcohol, weapons, and counterfeit products. You are solely responsible for your interactions with other users.</p>
          
          <h2 className="text-2xl font-semibold">4. Disclaimers</h2>
          <p>CampusTrade is a platform that connects buyers and sellers. We are not a party to any transaction. We do not guarantee the quality, safety, or legality of items listed. All transactions are conducted at your own risk.</p>
          
          <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, CampusTrade shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
        </div>
      </div>
    </div>
  );
}