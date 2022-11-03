import * as React from 'react';
import Box from '@mui/material/Box';
import ExpandIcon from '@mui/icons-material/ExpandMore';
import CollapseIcon from '@mui/icons-material/ChevronRight';
import TreeView from '@mui/lab/TreeView';
import MuiTreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import clsx from 'clsx';
import { styled, lighten } from '@mui/material/styles';
import { usePaletteMode } from '../ThemeContext';

function getType(value: unknown) {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'string' && /^(#|rgb|rgba|hsl|hsla)/.test(value)) {
    return 'color';
  }

  return typeof value;
}

function getLabel(value: unknown, type: ReturnType<typeof getType>): string {
  switch (type) {
    case 'array':
      return `Array(${(value as unknown[]).length})`;
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'function':
      return `f ${(value as Function).name}()`;
    case 'object':
      return 'Object';
    case 'string':
      return `"${value}"`;
    case 'symbol':
      return `Symbol(${String(value)})`;
    case 'bigint':
    case 'boolean':
    case 'number':
    default:
      return String(value);
  }
}

function getTokenType(type: string): string {
  switch (type) {
    case 'color':
      return 'string';
    case 'object':
    case 'array':
      return 'comment';
    default:
      return type;
  }
}

const Color = styled('span')(({ theme }) => ({
  backgroundColor: '#fff',
  display: 'inline-block',
  marginBottom: -1,
  marginRight: theme.spacing(0.5),
  border: '1px solid',
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%202%202%22%3E%3Cpath%20d%3D%22M1%202V0h1v1H0v1z%22%20fill-opacity%3D%22.2%22%2F%3E%3C%2Fsvg%3E")',
}));

interface ObjectEntryLabelProps {
  objectKey?: unknown;
  objectValue?: unknown;
}

function ObjectEntryLabel(props: ObjectEntryLabelProps) {
  const { objectKey, objectValue } = props;
  const type = getType(objectValue);
  const label = getLabel(objectValue, type);
  const tokenType = getTokenType(type);

  return (
    <React.Fragment>
      {`${objectKey}: `}
      {type === 'color' ? (
        <Color style={{ borderColor: lighten(label, 0.7) }}>
          <Box
            component="span"
            sx={{ display: 'block', width: 11, height: 11 }}
            style={{ backgroundColor: label }}
          />
        </Color>
      ) : null}
      <span className={clsx('token', tokenType)}>{label}</span>
    </React.Fragment>
  );
}

const TreeItem = styled(MuiTreeItem)({
  [`&:focus > .${treeItemClasses.content}`]: {
    outline: `2px dashed ${lighten('#333', 0.3)}`,
  },
});

interface ObjectEntriesProps {
  nodeId: string;
  entries: [string, unknown][];
}

function renderObjectEntries({ entries, nodeId }: ObjectEntriesProps): React.ReactNode {
  return entries.map(([key, value]) => {
    return (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      <ObjectEntry key={key} nodeId={`${nodeId}.${key}`} objectKey={key} objectValue={value} />
    );
  });
}

interface ObjectEntriesProps {
  nodeId: string;
  entries: [string, unknown][];
}

interface ObjectEntryProps {
  nodeId: string;
  objectKey: string;
  objectValue?: unknown;
}

function ObjectEntry(props: ObjectEntryProps) {
  const { nodeId, objectKey, objectValue } = props;
  let children = null;

  if (
    (objectValue !== null && typeof objectValue === 'object') ||
    typeof objectValue === 'function'
  ) {
    children = renderObjectEntries({ entries: Object.entries(objectValue), nodeId });
  }

  const x = React.Children.count(children);

  return (
    <TreeItem
      nodeId={nodeId}
      label={<ObjectEntryLabel objectKey={objectKey} objectValue={objectValue} />}
    >
      {x > 0 ? children : undefined}
    </TreeItem>
  );
}

const MuiTreeViewDark = styled(TreeView)({
  color: '#d4d4d4',
  background: '#0c2945',
  '& .MuiTreeItem-label': {
    fontSize: 12,
    fontFamily:
      '"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;',
  },
  '& .token.string': {
    color: '#ce9178',
  },
  '& .token.boolean': {
    color: '#569cd6',
  },
  '& .token.number': {
    color: '#b5cea8',
  },
  '& .token.comment': {
    color: '#608b4e',
  },
  '& .token.null': {
    color: '#569cd6',
  },
  '& .token.undefined': {
    color: '#569cd6',
  },
  '& .token.function': {
    color: '#569cd6',
  },
});

const MuiTreeViewLight = styled(TreeView)({
  color: '#000000',
  background: '#ffffff',
  '& .MuiTreeItem-label': {
    fontSize: 12,
    fontFamily:
      '"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;',
  },
  '& .token.string': {
    color: '#a31515',
  },
  '& .token.boolean': {
    color: '#0000ff',
  },
  '& .token.number': {
    color: '#098658',
  },
  '& .token.comment': {
    color: '#008000',
  },
  '& .token.null': {
    color: '#0000ff',
  },
  '& .token.undefined': {
    color: '#0000ff',
  },
  '& .token.function': {
    color: '#0000ff',
  },
});

interface MuiObjectInspectorProps {
  data?: unknown;
  expandPaths?: string[];
}

export default function MuiObjectInspector(props: MuiObjectInspectorProps) {
  const { data = {}, expandPaths, ...other } = props;

  const paletteMode = usePaletteMode();
  const MuiTreeView = paletteMode === 'dark' ? MuiTreeViewDark : MuiTreeViewLight;

  const keyPrefix = '$ROOT';
  const defaultExpanded = React.useMemo(() => {
    return Array.isArray(expandPaths)
      ? expandPaths.map((expandPath) => `${keyPrefix}.${expandPath}`)
      : [];
  }, [keyPrefix, expandPaths]);
  // for default*  to take effect we need to remount
  const key = React.useMemo(() => defaultExpanded.join(''), [defaultExpanded]);

  return (
    <MuiTreeView
      key={key}
      defaultCollapseIcon={<ExpandIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      defaultExpanded={defaultExpanded}
      defaultExpandIcon={<CollapseIcon />}
      {...other}
    >
      {data && typeof data === 'object' ? (
        renderObjectEntries({ entries: Object.entries(data), nodeId: keyPrefix })
      ) : (
        <TreeItem
          nodeId={keyPrefix}
          label={
            <span className={clsx('token', getTokenType(getType(data)))}>
              {getLabel(data, getType(data))}
            </span>
          }
        />
      )}
    </MuiTreeView>
  );
}
