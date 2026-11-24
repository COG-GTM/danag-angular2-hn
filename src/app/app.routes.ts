import { Routes } from '@angular/router';

import { FeedComponent } from './feeds/feed/feed.component';

const feedRoutes: Routes = [{
  path: ':page',
  component: FeedComponent
}];

export const routes: Routes = [
  {path: '', redirectTo: 'news/1', pathMatch: 'full'},
  {
    path: 'news',
    children: feedRoutes,
    data: {feedType: 'news'}
  },
  {
    path: 'newest',
    children: feedRoutes,
    data: {feedType: 'newest'}
  },
  {
    path: 'show',
    children: feedRoutes,
    data: {feedType: 'show'}
  },
  {
    path: 'ask',
    children: feedRoutes,
    data: {feedType: 'ask'}
  },
  {
    path: 'jobs',
    children: feedRoutes,
    data: {feedType: 'jobs'}
  },
  {
    path: 'item',
    children: [{path: ':id', loadComponent: () => import('./item-details/item-details.component').then(m => m.ItemDetailsComponent)}]
  },
  {
    path: 'user',
    children: [{path: ':id', loadComponent: () => import('./user/user.component').then(m => m.UserComponent)}]
  }
];
