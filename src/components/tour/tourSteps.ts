// Tour step definitions for OptiSys guided experience

export interface TourStep {
  id: number;
  title: string;
  description: string;
  page: string;
  storyText: string;
  layer: string;
}

export const tourSteps: TourStep[] = [
  {
    id: 1,
    title: 'Knowledge Base',
    description: 'Select a procedure to follow',
    page: '/knowledge-base',
    layer: 'Layer 1',
    storyText: 'Welcome to the Knowledge Base - Layer 1 of OptiSys. This serves as the single source of truth for all governance and procedural content. Select a procedure to follow through the entire operational cycle.',
  },
  {
    id: 2,
    title: 'AI Assistant',
    description: 'Query about the procedure',
    page: '/chat',
    layer: 'Layer 2',
    storyText: 'The AI Copilot sits on top of the Knowledge Base, giving operators and managers a natural-language interface. Try asking about the procedure you selected - its steps, compliance history, or which facilities struggle with it.',
  },
  {
    id: 3,
    title: 'Procedure Analysis',
    description: 'View procedure details & metrics',
    page: '/procedures',
    layer: 'Layer 1',
    storyText: 'Now we drill into the specific procedure. This view shows procedure-level analytics: compliance rates, incident correlation, and step-by-step adherence data. Notice how each step\'s completion affects overall quality.',
  },
  {
    id: 4,
    title: 'Field Experience',
    description: 'Complete digital checklist',
    page: '/field-experience',
    layer: 'Layer 3',
    storyText: 'Here\'s where operational execution happens. A field worker receives an assigned task with a digital checklist linked to the procedure. Complete the steps and submit - this creates real data that flows back into the system.',
  },
  {
    id: 5,
    title: 'Data Hub',
    description: 'View stored work order record',
    page: '/knowledge-base',
    layer: 'Layer 4',
    storyText: 'The completed task is now stored in the Data Hub. Every execution becomes a data point - notice your new work order with its compliance status, quality score, and duration. This data feeds the analytics engine.',
  },
  {
    id: 6,
    title: 'Analytics Engine',
    description: 'See analytics impact',
    page: '/',
    layer: 'Layer 5',
    storyText: 'The Analytics Engine correlates procedure adherence with operational outcomes. Your completed task contributes to these metrics - demonstrating the measurable link between process compliance and business results.',
  },
  {
    id: 7,
    title: 'Procedure Impact',
    description: 'View work order impact on procedure',
    page: '/procedures',
    layer: 'Layer 6',
    storyText: 'Let\'s return to the procedure you worked on. Notice your completed work order now appears in the history. The compliance rate, quality scores, and step adherence metrics have been updated - this is the data-driven feedback that enables measurable process improvement.',
  },
  {
    id: 8,
    title: 'Feedback Loop',
    description: 'Continuous improvement insights',
    page: '/',
    layer: 'Layer 7',
    storyText: 'Finally, the Feedback Loop closes the circle. Insights generated from analytics inform procedure updates. When a procedure shows poor outcomes, the system flags it for review - creating continuous improvement without manual monitoring.',
  },
];

export const TOTAL_STEPS = tourSteps.length;
