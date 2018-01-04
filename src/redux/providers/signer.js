// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { signerRequestsToConfirm } from './signerActions';

let instance = null;

export default class Signer {
  constructor (store, api) {
    this._api = api;
    this._store = store;
  }

  start () {
    this._subscribeRequestsToConfirm();
  }

  _subscribeRequestsToConfirm () {
    const callback = (error, pending) => {
      if (error) {
        return;
      }

      this._store.dispatch(signerRequestsToConfirm(pending || []));
    };

    // FIXME: Something weird is going on in the API with pending requests - it should return the initial value immediately
    this._api
      .subscribe('signer_requestsToConfirm', callback)
      .then(() => this._api.signer.requestsToConfirm())
      .then((pending) => callback(null, pending));
  }

  static init (store) {
    const { api } = store.getState();

    if (!instance) {
      instance = new Signer(store, api);
    }

    return instance;
  }

  static start () {
    if (!instance) {
      return Promise.reject(new Error('SignerProvider has not been initiated yet'));
    }

    return Signer
      .stop()
      .then(() => {
        instance.start();
      });
  }

  static stop () {
    return Promise.resolve();
  }
}
