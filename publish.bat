@echo off
echo NPM PUBLISH
echo Before continuing, ensure that:
echo - you are logged in (npm whoami)
echo - you have successfully rebuilt all the libraries (npm run...)
pause

cd .\dist\myrmidon\cadmus-fr-epigraphy-ligatures
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-epigraphy-pg
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-epigraphy-signs
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-epigraphy-support
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-epigraphy-support-frr
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-epigraphy-writing
call npm publish --access=public
cd ..\..\..
pause

cd .\dist\myrmidon\cadmus-part-epigraphy-formula-patterns
call npm publish --access=public
cd ..\..\..
pause

echo ALL DONE
