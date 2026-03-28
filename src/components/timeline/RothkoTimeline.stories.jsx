import React from 'react';
import Box from '@mui/material/Box';
import { RothkoTimeline } from './RothkoTimeline.jsx';
import worksData from '../../data/rothko/rothko_works.json';
import eventsData from '../../data/rothko/rothko_events.json';

export default {
  title: 'Page/RothkoTimeline',
  component: RothkoTimeline,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `## 마크 로스코 인터랙티브 타임라인\n\n1903-1970 생애를 가로 스크롤 타임라인으로 시각화.\nX축: 시간 | Y축: 엔트로피 밴드 (팽창/발산/균형/수축/소멸)\n47개 주요 작품이 엔트로피 밴드에 배치됨.`,
      },
    },
  },
  argTypes: {
    pxPerYear: {
      control: { type: 'range', min: 120, max: 400, step: 10 },
      description: '연도당 픽셀 수',
    },
    backgroundColor: {
      control: 'color',
      description: '배경색',
    },
  },
};

const timelineRender = (args) => (
  <RothkoTimeline
    worksData={ worksData }
    eventsData={ eventsData }
    { ...args }
  />
);

export const Default = {
  args: {
    pxPerYear: 250,
    backgroundColor: '#FAFAFA',
  },
  render: timelineRender,
};

export const Wide = {
  args: {
    pxPerYear: 400,
    backgroundColor: '#FFFFFF',
  },
  render: timelineRender,
};
