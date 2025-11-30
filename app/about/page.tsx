export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 pt-24 md:pt-32">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">About CampusTrade</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Connecting students, one trade at a time.
          </p>
        </div>
        <div className="space-y-4 text-foreground/80">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p>
            At CampusTrade, our mission is to create a safe, affordable, and convenient marketplace exclusively for university students. We believe that buying and selling used items within a trusted campus community shouldn't be complicated. We aim to help students save money, reduce waste, and connect with their peers in a meaningful way.
          </p>
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p>
            Founded in a dorm room by a group of students tired of the hassle of traditional online marketplaces, CampusTrade was born out of a simple idea: what if there was a platform where you could only deal with verified students from your own university? This simple concept of a closed, trusted network has driven us to build the platform you see today. We are passionate about fostering a community of trust and making student life just a little bit easier.
          </p>
          <h2 className="text-2xl font-semibold">Why Choose Us?</h2>
          <p>
            <strong>University-Verified:</strong> Every user is verified with their university email, ensuring you're always trading with a fellow student.
          </p>
          <p>
            <strong>Safety First:</strong> With a closed community and in-person handoffs, we prioritize your safety above all else.
          </p>
          <p>
            <strong>For Students, By Students:</strong> We understand the unique needs of student life because we live it too. Our platform is designed to be simple, fast, and effective for your needs.
          </p>
        </div>
      </div>
    </div>
  );
}