import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import WealthInequalityApp from './components/WealthInequalityApp';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/wealth-cap" component={WealthInequalityApp} />
        <Route path="/" exact>
          <div>Home – navigate to <a href="/wealth-cap">Wealth Cap</a></div>
        </Route>
      </Switch>
    </Router>
  );
}