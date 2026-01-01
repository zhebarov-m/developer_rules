import '@/app/styles/index.css';
import { FinalHomePage } from '@/pages/home';
import { FULL_RULES_CONTENT } from './providers/fullRulesContent';
import { BACKEND_RULES_CONTENT } from './providers/backendRulesContent';

/**
 * App layer - точка входа приложения
 * С поддержкой Frontend и Backend правил
 */
function App() {
  return (
    <FinalHomePage 
      frontendContent={FULL_RULES_CONTENT}
      backendContent={BACKEND_RULES_CONTENT}
    />
  );
}

export default App;
