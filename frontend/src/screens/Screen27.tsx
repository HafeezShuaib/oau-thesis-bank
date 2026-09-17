import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen27AIAssistant = () => <AuthenticatedLayout title="AI Research Assistant"><UnavailableState title="AI research assistant is not connected" description="The backend has no assistant or retrieval-augmented generation endpoint. No simulated answers are shown." /></AuthenticatedLayout>;
export default Screen27AIAssistant;
