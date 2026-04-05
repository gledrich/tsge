let currentScriptId = 'script';

export const setCurrentScriptId = (id: string) => {
  currentScriptId = id;
};

export const getCurrentScriptId = () => currentScriptId;

const createInitialFile = async (id: string) => {
  const defaultContent = `import { Engine, Scene, Sprite, Vector2, Text } from 'dino-ge';

// Your playground script starts here!
`;
  
  await fetch(`/api/scripts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      data: defaultContent,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return defaultContent;
};

export const getFilesList = async (): Promise<string[]> => {
  const res = await fetch('/files');
  if (res.ok) {
    return await res.json();
  }
  return [];
};

export const getScript = async (id: string = currentScriptId): Promise<string> => {
  const res = await fetch(`/api/scripts/${id}`);

  if (res.status === 404) {
    return await createInitialFile(id);
  } else if (res.status === 200) {
    return await res.json();
  } else {
    window.alert('Error loading script');
    return '';
  }
};

export const updateScript = async (data: string, upsert = true, id: string = currentScriptId) => {
  const res = await fetch(`/api/scripts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      data,
      upsert,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    window.alert('Error updating script.');
  }
};
