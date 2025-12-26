import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqPage() {
  const faqs = [
    {
      question: "Is CampusTrade free to use?",
      answer: "Yes, CampusTrade is completely free for all verified university students. There are no listing fees or commissions on sales.",
    },
    {
      question: "How do I verify my account?",
      answer: "Account verification is done automatically when you sign up with your official university email address. You will receive a confirmation link to that email to complete your registration.",
    },
    {
      question: "How do transactions work?",
      answer: "Transactions are arranged directly between the buyer and seller through our secure messaging system. We recommend meeting in a public, well-lit place on campus to exchange the item and payment.",
    },
    {
      question: "What should I do if I have a problem with a transaction?",
      answer: "If you encounter any issues, please reach out to our support team at campustrade.marvin@gmail.com. While we are not a party to transactions, we will do our best to mediate and resolve disputes.",
    },
    {
      question: "Can I sell anything on CampusTrade?",
      answer: "You can sell most items that are relevant to student life, such as textbooks, electronics, furniture, and clothing. Please refer to our Terms of Service for a full list of prohibited items.",
    },
  ];

  return (
    <div className="container mx-auto max-w-3xl py-10 pt-24 md:pt-32">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to the most common questions about CampusTrade.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}