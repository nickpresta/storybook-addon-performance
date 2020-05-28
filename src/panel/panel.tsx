import { Channel } from '@storybook/channels';
import { styled } from '@storybook/theming';
import React, { useMemo } from 'react';
import { getInteractionGroup } from '../tasks/get-interaction-group';
import getPresets from '../tasks/preset';
import {
  Nullable,
  PublicInteractionTask,
  TaskGroup,
  TaskGroupResult,
  AllowedGroup,
} from '../types';
import machine, { RunContext } from './machine';
import ServiceContext from './service-context';
import TaskGroupPanel from './task-group';
import Topbar from './top-bar';
import usePanelMachine from './use-panel-machine';
import { panelId } from '../selectors';

const Container = styled.div`
  --grid: 10px;
  --halfGrid: calc(var(--grid) / 2);

  font-size: 16px;
  line-height: 1.5;
`;

const GroupContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  min-height: 100%;
  padding: 0 var(--halfGrid);
`;

function findResult(group: TaskGroup, context: Nullable<RunContext>): Nullable<TaskGroupResult> {
  if (!context || !context.results) {
    return null;
  }

  const result: TaskGroupResult | undefined = context.results.find(
    (item: TaskGroupResult) => item.groupId === group.groupId,
  );

  return result || null;
}

function getResult(group: TaskGroup, context: RunContext): Nullable<TaskGroupResult> {
  const result: Nullable<TaskGroupResult> = findResult(group, context);
  return result;
}

export default function Panel({
  channel,
  interactions,
  allowedGroups,
}: {
  channel: Channel;
  interactions: PublicInteractionTask[];
  allowedGroups: AllowedGroup[];
}) {
  const { state, service } = usePanelMachine(machine, channel);

  const groups: TaskGroup[] = useMemo(
    function merge() {
      const preset = getPresets({ allowedGroups });
      return [...preset, getInteractionGroup(interactions)];
    },
    [interactions, allowedGroups],
  );

  return (
    <ServiceContext.Provider value={service}>
      <Container id={panelId}>
        <Topbar />
        <GroupContainer>
          {groups.map((group: TaskGroup) => {
            if (state.context.current.results == null) {
              return null;
            }
            return (
              <TaskGroupPanel
                key={group.groupId}
                group={group}
                result={getResult(group, state.context.current)}
                pinned={findResult(group, state.context.pinned)}
              />
            );
          })}
        </GroupContainer>
      </Container>
    </ServiceContext.Provider>
  );
}
