import React, { useMemo ,useState,useContext,useEffect, useCallback} from 'react';
import { useLocation } from 'react-router-dom';
import {
  PiList,
  // PiHouse,
  //PiChatCircleText,
  // PiPencil,
  // PiNote,
  // PiChatsCircle,
  // PiPenNib,
  // PiMagnifyingGlass,
  // PiTranslate,
  // PiImages,
  // PiSpeakerHighBold,
  // PiGear,
  // PiGlobe,
  PiX,
  // PiGear,
  // PiRobot,
  // PiUploadSimple,
} from 'react-icons/pi';
import { Outlet } from 'react-router-dom';
import Drawer, { ItemProps } from './components/Drawer';
import ButtonIcon from './components/ButtonIcon';
import '@aws-amplify/ui-react/styles.css';
import useDrawer from './hooks/useDrawer';
import useVersion from './hooks/useVersion';
import useConversation from './hooks/useConversation';
import PopupInterUseCasesDemo from './components/PopupInterUseCasesDemo';
import useInterUseCases from './hooks/useInterUseCases';
import {SuggestionPanel} from './components/SuggestionPanel';
import {NewSuggestionItemPanel} from './components/NewSuggestionItemPanel';
import {UpdateSuggestionItemPanel} from './components/UpdateSuggestionItemPanel';
import {AppStateContext } from "./state/AppProvider";
import IconWithDot from './components/IconWithDot';
import useSWR from 'swr';
import { Auth } from 'aws-amplify';
import useChatApi from './hooks/useChatApi';
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
  Typography,
} from "@material-tailwind/react";

import {
  CreatePromptsRequest,
  ToBeRecordedPrompt,
  RecordedPrompt,
  UpdatePromptRequest,
} from 'generative-ai-use-cases-jp';

//const ragEnabled: boolean = import.meta.env.VITE_APP_RAG_ENABLED === 'true';
//const agentEnabled: boolean = import.meta.env.VITE_APP_AGENT_ENABLED === 'true';
//const recognizeFileEnabled: boolean =
//  import.meta.env.VITE_APP_RECOGNIZE_FILE_ENABLED === 'true';

const items: ItemProps[] = [
 // {
  //   label: 'ホーム',
  //   to: '/',
  //   icon: <PiHouse />,
  //   display: 'usecase' as const,
  //   name:'home',
  // },
  // {
  //   label: '設定情報',
  //   to: '/setting',
  //   icon: <PiGear />,
  //   display: 'none' as const,
  // },
  // {
  //   label: 'チャット',
  //   to: '/chat',
  //   icon: <PiChatsCircle />,
  //   display: 'usecase' as const,
  //   name:'chat',
  // },

  // ragEnabled
  //   ? {
  //       label: 'RAG チャット',
  //       to: '/rag',
  //       icon: <PiChatCircleText />,
  //       display: 'usecase' as const,
  //       name:'rag',
  //     }
  //   : null,
 // agentEnabled
  //   ? {
  //       label: 'Agent チャット',
  //       to: '/agent',
  //       icon: <PiRobot />,
  //       display: 'usecase' as const,
  //     }
  //   : null,
  // {
  //   label: '文章生成',
  //   to: '/generate',
  //   icon: <PiPencil />,
  //   display: 'usecase' as const,
  // },
  // {
  //   label: '要約',
  //   to: '/summarize',
  //   icon: <PiNote />,
  //   display: 'usecase' as const,
  // },
  // {
  //   label: '校正',
  //   to: '/editorial',
  //   icon: <PiPenNib />,
  //   display: 'usecase' as const,
  // },
  // {
  //   label: '翻訳',
  //   to: '/translate',
  //   icon: <PiTranslate />,
  //   display: 'usecase' as const,
  // },
  // {
  //   label: 'Web コンテンツ抽出',
  //   to: '/web-content',
  //   icon: <PiGlobe />,
  //   display: 'usecase' as const,
  // },
  // {
  //   label: '画像生成',
  //   to: '/image',
  //   icon: <PiImages />,
  //   display: 'usecase' as const,
  // },
  // {
  //   label: '音声認識',
  //   to: '/transcribe',
  //   icon: <PiSpeakerHighBold />,
  //   display: 'tool' as const,
  // },
  // recognizeFileEnabled
  //   ? {
  //       label: 'ファイルアップロード',
  //       to: '/file',
  //       icon: <PiUploadSimple />,
  //       display: 'tool' as const,
  //     }
  //   : null,
  // ragEnabled
  //   ? {
  //       label: 'Kendra 検索',
  //       to: '/kendra',
  //       icon: <PiMagnifyingGlass />,
  //       display: 'tool' as const,
  //     }
  //   : null,
].flatMap((i) => (i !== null ? [i] : []));

// /chat/:chatId の形式から :chatId を返す
// path が別の形式の場合は null を返す
const extractChatId = (path: string): string | null => {
  const pattern = /\/chat\/(.+)/;
  const match = path.match(pattern);

  return match ? match[1] : null;
};

const App: React.FC = () => {
  const { getHasUpdate } = useVersion();
  const { createPrompts,updatePrompt} =  useChatApi();

  const { data: prompts, error } = useChatApi().listPrompts();

  

  // 第一引数は不要だが、ないとリクエストされないため 'user' 文字列を入れる
  const { data } = useSWR('user', async () => {
    return await Auth.currentAuthenticatedUser();
  });

  const email = useMemo(() => {
    return data?.signInUserSession?.idToken?.payload?.email ?? '';
  }, [data]);

  const hasUpdate = getHasUpdate();

  const { switchOpen: switchDrawer, opened: isOpenDrawer } = useDrawer();
  const { pathname } = useLocation();
  const { getConversationTitle } = useConversation();
  const { isShow } = useInterUseCases();

  const label = useMemo(() => {
    const chatId = extractChatId(pathname);

    if (chatId) {
      return getConversationTitle(chatId) || '';
    } else {
      return items.find((i) => i.to === pathname)?.label || '';
    }
  }, [pathname, getConversationTitle]);


  const appStateContext = useContext(AppStateContext)

  const [recordedPrompts, setRecordedPrompts] = useState<RecordedPrompt[]>([]);
  useEffect(() => {
    if (prompts&&!error){
      console.log(prompts.prompts);
      setRecordedPrompts(prompts.prompts);
    }
  }, [prompts,error]);

  const onSave =async (recordedPrompt: RecordedPrompt) => {
  const newRecordedPrompts = [...recordedPrompts, recordedPrompt];
  setRecordedPrompts(newRecordedPrompts);
  const prompts: ToBeRecordedPrompt[] = [
    {
      title: recordedPrompt.title,
      content: recordedPrompt.content,
      type: recordedPrompt.type,
    }
  ];
  const requestprompt: CreatePromptsRequest = {prompts};
  await createPrompts(requestprompt);
  };

  const [updatePromptItem, setUpdatePromptItem] = useState<RecordedPrompt>();

  const handleUpdatePromptChange = (newPromptItem:RecordedPrompt) => {
    setUpdatePromptItem(newPromptItem);
  };

  const handleDoUpdatePromptChange =async (recordedPrompt: RecordedPrompt) => {
    const prompts: UpdatePromptRequest = 
      {
        uuid: recordedPrompt.uuid,
        createdDate:recordedPrompt.createdDate,
        content: recordedPrompt.content,
        type:recordedPrompt.type,
      }
    ;
    const requestprompt: UpdatePromptRequest = prompts;
    await updatePrompt(requestprompt);

    // 更新本地状态
    const updatedRecordedPrompts = recordedPrompts.map((prompt) => {
      if (prompt.uuid === recordedPrompt.uuid) {
        // 返回更新后的对象
        return {
          ...prompt, // 拷贝原有属性
          content: recordedPrompt.content, // 使用新的内容
          // 这里可以根据需要更新其他字段
        };
      }
      return prompt; // 对于不匹配的项，返回原对象
    });

    // 设置新的状态
    setRecordedPrompts(updatedRecordedPrompts);

  };

  const signOut = useCallback(async () => {
    await Auth.signOut();
  }, []);

  return (
    <div className="screen:w-screen screen:h-screen overflow-x-hidden">
      <main className="flex-1">
        <div className='bg-aws-smile h-10 rounded-lg'>
          <div className="flex text-white items-center justify-end border-t border-gray-400 px-3 py-2">
            
            <IconWithDot showDot={hasUpdate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 ">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </IconWithDot>
            
            {/* <Link
              to="/setting"
              className="mr-2 overflow-x-hidden hover:brightness-75">
              <span className="text-sm">{email}</span>
            </Link> */}
            <Menu>
              <MenuHandler>
                <Button placeholder={undefined}>{email}</Button>
              </MenuHandler>
              <MenuList placeholder={undefined}>
                <hr className="my-2 border-blue-gray-50" />
                <MenuItem onClick={signOut} className="flex items-center gap-2 " placeholder={undefined}>
                  <svg
                    width="16"
                    height="14"
                    viewBox="0 0 16 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V13C0 13.2652 0.105357 13.5196 0.292893 13.7071C0.48043 13.8946 0.734784 14 1 14C1.26522 14 1.51957 13.8946 1.70711 13.7071C1.89464 13.5196 2 13.2652 2 13V1C2 0.734784 1.89464 0.48043 1.70711 0.292893C1.51957 0.105357 1.26522 0 1 0ZM11.293 9.293C11.1108 9.4816 11.01 9.7342 11.0123 9.9964C11.0146 10.2586 11.1198 10.5094 11.3052 10.6948C11.4906 10.8802 11.7414 10.9854 12.0036 10.9877C12.2658 10.99 12.5184 10.8892 12.707 10.707L15.707 7.707C15.8945 7.51947 15.9998 7.26516 15.9998 7C15.9998 6.73484 15.8945 6.48053 15.707 6.293L12.707 3.293C12.6148 3.19749 12.5044 3.12131 12.3824 3.0689C12.2604 3.01649 12.1292 2.9889 11.9964 2.98775C11.8636 2.9866 11.7319 3.0119 11.609 3.06218C11.4861 3.11246 11.3745 3.18671 11.2806 3.2806C11.1867 3.3745 11.1125 3.48615 11.0622 3.60905C11.0119 3.73194 10.9866 3.86362 10.9877 3.9964C10.9889 4.12918 11.0165 4.2604 11.0689 4.3824C11.1213 4.50441 11.1975 4.61475 11.293 4.707L12.586 6H5C4.73478 6 4.48043 6.10536 4.29289 6.29289C4.10536 6.48043 4 6.73478 4 7C4 7.26522 4.10536 7.51957 4.29289 7.70711C4.48043 7.89464 4.73478 8 5 8H12.586L11.293 9.293Z"
                      fill="#90A4AE"
                    />
                  </svg>
                  <Typography variant="small" className="font-medium" placeholder={undefined}>
                    Sign Out
                  </Typography>
                </MenuItem>              
              </MenuList>
            </Menu>
          </div>
        </div>
        <header className="bg-aws-squid-ink visible flex h-12 w-full items-center justify-between text-lg text-white lg:invisible lg:h-0 print:hidden">
          <div className="flex w-10 items-center justify-start">
            <button
              className="focus:ring-aws-sky mr-2 rounded-full  p-2 hover:opacity-50 focus:outline-none focus:ring-1"
              onClick={() => {
                switchDrawer();
              }}>
              <PiList />
            </button>
          </div>
          {label}
          {/* label を真ん中にするためのダミーのブロック */}
          <div className="w-10" />
        </header>

        <div
          className={`fixed -left-64 top-10 z-50 transition-all lg:left-0 lg:z-0 ${isOpenDrawer ? 'left-0' : '-left-64'}`}>
          <Drawer items={items} />
        </div>
        <SuggestionPanel recordedPrompts={recordedPrompts} onUpdatePromptChange={handleUpdatePromptChange} />
        {appStateContext?.state.isNewSuggestionOpen && <NewSuggestionItemPanel onSave={onSave}/>}
        {appStateContext?.state.isUpdateSuggestionOpen && updatePromptItem && <UpdateSuggestionItemPanel updatePromptItem={updatePromptItem} onUpdatePromptChange={handleDoUpdatePromptChange} />}
        <div
          id="smallDrawerFiller"
          className={`${isOpenDrawer ? 'visible' : 'invisible'} lg:invisible`}>
          <div
            className="screen:h-screen fixed top-0 z-40 w-screen bg-gray-900/90"
            onClick={switchDrawer}></div>
          <ButtonIcon
            className="fixed left-64 top-0 z-40 text-white"
            onClick={switchDrawer}>
            <PiX />
          </ButtonIcon>
        </div>
        <div className="text-aws-font-color lg:ml-64 lg:mr-64" id="main">
          {/* ユースケース間連携時に表示 */}
          {isShow && <PopupInterUseCasesDemo />}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default App;
