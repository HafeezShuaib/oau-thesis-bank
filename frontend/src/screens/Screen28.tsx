import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen28AIAnswer = () => <AuthenticatedLayout title="AI Research Assistant"><UnavailableState title="AI answers are not connected" description="The connected backend does not expose AI answer generation or source citations." /></AuthenticatedLayout>;
export default Screen28AIAnswer;
