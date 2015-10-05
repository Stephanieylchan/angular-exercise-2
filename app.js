var app = angular.module('flapperNews', ['ui.router']);

//MainCtrl Controller
app.controller('MainCtrl', [
'$scope', 'posts',   //factory posts
function($scope, posts)
{
    $scope.posts = posts.posts; //factory posts array ---> $scope.posts
    
    //Add post function
    $scope.addPost = function() //home.html, access $scope, function() = addPost()
    {
        if(!$scope.title || $scope.title === '') { return; } //Blank input declined
        posts.create({
            title: $scope.title,
            link: $scope.link,
        });
        $scope.index = $scope.posts.length ; //i.e. 1 post - .length = 1, 1st post: 0, 2st post: 1
        $scope.posts.push({title: $scope.title, link: $scope.link, upvotes: 0, index: $scope.index, comments:[]}); //append
        // Array[ ] ---> pushed ---> Array[1 item], ---> pushed ---> Array[2 item]
        // {{post.title}} ---> show $scope.title
        //
        // 
        //
        $scope.title = '';
        $scope.link = '';
    };
    
    //Upvoting function
    $scope.incrementUpvotes = function(post) {
        post.upvotes(post);
    };
    
    
}]);

//PostsCtrl Controller
app.controller('PostsCtrl', [
'$scope',
'posts',
'post',
function($scope, posts, post){
    $scope.post = post; //posts[title, upvote, id, comments]

    //    /posts/{id}/details/:type <--- state url       /posts/{id}
    //    navigate url : /posts/1/details/a            /posts/1
    //    $stateParams : { id: '1', type: 'a'}        $stateParams.ID = 1 ---> posts.posts[1] ---> title : post 1
    
    //Add comment function
    $scope.addComment = function() 
    {
        if ($scope.body === '') {return;}
        posts.addComment(post._id, {
            body: $scope.body,
            author: 'user',
        }).success(function(comment){
            $scope.post.comments.push(comment);
        });
        $scope.body = '';
    };
    
    //Upvoting function
    $scope.incrementUpvotes = function(comment) 
    {
        posts.upvotesComment(post, comment);
    };
    
}]);


//Service Factory
app.factory('posts', ['$http', function($http){ //Name:posts contains object o, object o contains posts[array]

{
  var o = {posts: 
    [
        {title: 'post 0', upvotes: 5, index: 0, comments:[{author: 'Joe', body: 'Cool post!', upvotes: 0}]},
        {title: 'post 1', upvotes: 2, index: 1, comments:[]},
        {title: 'post 2', upvotes: 15, index: 2,comments:[]},
        {title: 'post 3', upvotes: 9, index: 3,comments:[]},
        {title: 'post 4', upvotes: 4, index: 4,comments:[]}
    ]};
  return o;
  
  o.getAll = function(){
      return $http.get('/posts').success(function(data){
          angular.copy(data, o.posts);
      });
  };
  
  o.create = function(post) {
      return $http.post('/posts', post).success(function(data){
          o.posts.push(data);
      });
  };
  
  o.upvote = function(post){
      return $http.put('/post' + post._id + '/upvote')
      .success(function(data){
          post.upvotes += 1;
      });
  };
  
  o.get = function(id){
      return $http.get('/posts' + id).then(function(res){
          return res.data;
      });
  };
  
  o.addComment = function(id, comment){
      return $http.post('/posts' + id + '/comments', comment);
  };
  
  o.upvoteComment = function(post, comment){
      return $http.put('/posts' + post._id + '/comments' + comment._id +
      '/upvote')
      .success(function(data){
          comment.upvotes += 1;
      });
  };
}
}]);

//UI-router config
app.config([
'$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider)   //Forum --> post(), comment()
{
    $stateProvider.state('home',    // <ui-view></ui-view> 
    {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl'
    });
    
    $stateProvider.state('posts', 
    {
        url: '/posts/{id}',  // #/posts/{{post.index}}   {id} get {{post.index}}
        templateUrl: '/posts.html',
        controller: 'PostsCtrl'
    });
    
    .state('home',{
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve:{
            postPromise: ['posts', function(posts){
                return posts.getAll();
            }]
        }
    })
    
    .state('posts',{
        url: 'posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostCtrl',
        resolve:{
            post: ['$stateParams', 'posts', function($stateParams, posts){
                return posts.get($stateParams.id);
            }]
        }
    });
    
    $urlRouterProvider.otherwise('home');
}]);







