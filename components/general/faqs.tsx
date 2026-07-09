import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqsSection() {
  return (
    <div className="mx-auto my-14 w-full max-w-5xl flex items-end justify-end">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-4 px-4 pt-12">
          <h2 className="font-bold text-3xl md:text-4xl">FAQs</h2>
          <p className="text-muted-foreground">
            Here are some common questions and answers about CUI Portal
            Enhancement.
          </p>
        </div>
        <div>
          <Accordion className="rounded-none" collapsible type="single">
            {questions.map((item) => (
              <AccordionItem className="px-4" key={item.id} value={item.id}>
                <AccordionTrigger className="py-4 hover:no-underline focus-visible:underline focus-visible:ring-0">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

const questions = [
  {
    id: "item-1",
    title: "What is CUI Portal Enhancement?",
    content:
      "CUI Portal Enhancement is a project aimed to add new features to Existing COMSATS University Islamabad portal.",
  },
  {
    id: "item-2",
    title: "Who is CUI Portal Enhancement built for?",
    content:
      "CUI Portal Enhancement is built for the students, Professors, Batch-Advisors, HOD, Admin, Accountant and Clerk.",
  },
  {
    id: "item-3",
    title: "What features does CUI Portal Enhancement include?",
    content:
      "This project includes features like student leave approvals, institutional announcements, fee installment split requests and student complaints with full audit trails.",
  },
  {
    id: "item-4",
    title: "Is this project open-source?",
    content:
      "Yes. CUI Portal Enhancement is open-source and available on GitHub for anyone to contribute to or use.",
  },
  {
    id: "item-5",
    title: "Which technologies does CUI Portal Enhancement use?",
    content:
      "CUI Portal Enhancement is built using open-source technologies like React, Next.js, TypeScript, Arcjet and Inngest.",
  },
  {
    id: "item-6",
    title: "Does this project support payments?",
    content:
      "No, CUI Portal Enhancement does not support payments. It is designed to enhance the existing portal's functionality, Currently it uses simple flow to mark fee installment as paid.",
  },
  {
    id: "item-7",
    title: "How do I register as a student?",
    content:
      "You can go to apply route and register if not already to verify you email. Select the available semester and submit the form. You will be notified once your registeration is approved.",
  },
  {
    id: "item-8",
    title: "Can I register as an admin?",
    content: "No, only current admin can update your role to admin.",
  },
];
