import React from 'react';
import { AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen22IdeaChecker = () => <AuthenticatedLayout title="Research Idea Checker"><UnavailableState title="Idea checking is not connected" description="No similarity-analysis endpoint is available in the connected Django API." /></AuthenticatedLayout>;
export default Screen22IdeaChecker;
