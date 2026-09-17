import React from 'react';
import { useAppRouter, AuthenticatedLayout } from '../components/shared';
import { UnavailableState } from '../components/AsyncState';

const Screen31ResearcherActivity = () => { const { navigate } = useAppRouter(); return <AuthenticatedLayout title="Researcher Activity"><UnavailableState title="Research timelines are not connected" description="The Django backend exposes researcher profiles but not a profile activity or researcher-owned thesis timeline endpoint." /></AuthenticatedLayout>; };
export default Screen31ResearcherActivity;
