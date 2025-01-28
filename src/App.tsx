import React from 'react';
import { observer } from 'mobx-react-lite';
import HomePage from './pages/HomePage/HomePage';

const App: React.FC = observer(() => {
    return <HomePage />;
});

export default App;
