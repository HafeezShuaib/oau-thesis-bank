import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen24IdeaExtension = () => <AuthenticatedLayout title="How to Differentiate Your Research"><UnavailableState title="Idea extension suggestions are not connected" description="The connected backend does not expose AI-generated research extension recommendations." /></AuthenticatedLayout>;
export default Screen24IdeaExtension;
