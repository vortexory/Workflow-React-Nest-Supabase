import { Provider } from 'react-redux';
import { store } from './store/store';
import Editor from './pages/Editor';
import 'reactflow/dist/style.css';

export default function App() {
  return (
    <Provider store={store}>
      <Editor />
    </Provider>
  );
}