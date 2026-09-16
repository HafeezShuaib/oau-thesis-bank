import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen10ThesisAI = () => <AuthenticatedLayout title="Thesis AI Summary"><UnavailableState title="AI summaries are not connected" description="The Django backend currently exposes thesis records and files but no AI summary endpoint. This screen keeps its route without presenting fabricated analysis." /></AuthenticatedLayout>;
export default Screen10ThesisAI;
