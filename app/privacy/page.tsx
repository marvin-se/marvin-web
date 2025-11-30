export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 pt-24 md:pt-32">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: December 1, 2025</p>
        
        <div className="prose prose-lg max-w-none">
          <p>This Privacy Policy describes how CampusTrade ("we," "us," or "our") collects, uses, and discloses your information.</p>

          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account. This includes your name, university email address, and any other information you choose to provide.</p>

          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate and improve our Service, verify your student status, and facilitate communication between users. We will never share your university email with other users.</p>

          <h2 className="text-2xl font-semibold">3. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. However, no electronic transmission or storage is ever completely secure.</p>
          
          <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
          <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, so long as those parties agree to keep this information confidential.</p>
          
          <h2 className="text-2xl font-semibold">5. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.</p>
        </div>
      </div>
    </div>
  );
}