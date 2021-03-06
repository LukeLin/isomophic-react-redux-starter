import fetch from 'isomorphic-fetch'
import Immutable from 'immutable';

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_REDDIT = 'SELECT_REDDIT'
export const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT'

export function selectReddit(reddit) {
    return {
        type: SELECT_REDDIT,
        reddit
    }
}

export function invalidateReddit(reddit) {
    return {
        type: INVALIDATE_REDDIT,
        reddit
    }
}

function requestPosts(reddit) {
    return {
        type: REQUEST_POSTS,
        reddit
    }
}

function receivePosts(reddit, json) {
    return {
        type: RECEIVE_POSTS,
        reddit,
        posts: Immutable.fromJS(json.data.children.map(child => child.data)),
        receivedAt: Date.now()
    }
}

function fetchPosts(reddit) {
    return async function(dispatch) {
        dispatch(requestPosts(reddit))
        try {
            let response = await fetch(`https://www.reddit.com/r/${reddit}.json`, {
                method: 'GET',
                timeout: 5000
            }).then(response => response.json());
            dispatch(receivePosts(reddit, response))
        } catch(ex){
            console.error(ex);
        }
    }
}

function shouldFetchPosts(state, reddit) {
    const posts = state.get('postsByReddit').get(reddit)
    if (!posts) {
        return true
    }
    if (posts.get('isFetching')) {
        return false
    }
    return posts.get('didInvalidate')
}

export function fetchPostsIfNeeded(reddit) {
    return (dispatch, getState) => {
        if (shouldFetchPosts(getState(), reddit)) {
            return dispatch(fetchPosts(reddit))
        }
    }
}
